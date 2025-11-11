import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    try {
      const createdDocument = new this.model({
        ...document,
        _id: new Types.ObjectId(),
      });

      const result = await createdDocument.save();
      return result.toJSON() as unknown as TDocument;
    } catch (error) {
      this.logger.error('Failed to create document', error);
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = (await this.model
      .findOne(filterQuery)
      .lean(true)) as TDocument | null;

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findOneById(id: string): Promise<TDocument> {
    const document = (await this.model
      .findById(new Types.ObjectId(id))
      .lean(true)) as TDocument | null;

    if (!document) {
      console.log('id---', id);
      this.logger.warn('Document was not found with id', id);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean()) as TDocument | null;

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return (await this.model.find(filterQuery).lean()) as TDocument[];
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndDelete(filterQuery)
      .lean()) as TDocument | null;

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }
}
