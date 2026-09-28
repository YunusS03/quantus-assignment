import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CURRENCY } from '../currency.js';
import { DrawingObject, Prisma } from '../generated/prisma/client.js';
import { toMoney } from '../money.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateObjectDto } from './dto/create-object.dto.js';
import { UpdateObjectDto } from './dto/update-object.dto.js';

@Injectable()
export class ObjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const objects = await this.prisma.drawingObject.findMany({ orderBy: { name: 'asc' } });
    return objects.map(toResponse);
  }

  async findOne(id: string) {
    return toResponse(await this.findExisting(id));
  }

  async create(dto: CreateObjectDto) {
    await this.checkArticleExists(dto.articleId);
    try {
      return toResponse(await this.prisma.drawingObject.create({ data: dto }));
    } catch (error) {
      // P2002 is Prisma's error code for a unique constraint violation.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`An object with id ${dto.id} already exists`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateObjectDto) {
    await this.findExisting(id);
    if (dto.articleId !== undefined) {
      await this.checkArticleExists(dto.articleId);
    }
    return toResponse(await this.prisma.drawingObject.update({ where: { id }, data: dto }));
  }

  async remove(id: string) {
    await this.findExisting(id);
    await this.prisma.drawingObject.delete({ where: { id } });
  }

  // The objects page: only the article's own objects, not those of its child articles
  // (the rolled-up totals are what /summary is for).
  async findForArticle(articleId: number) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException(`Article ${articleId} not found`);
    }
    const objects = await this.prisma.drawingObject.findMany({
      where: { articleId },
      orderBy: { name: 'asc' },
    });

    // Sum unrounded values; round only for output.
    let total = new Prisma.Decimal(0);
    const rows = objects.map((object) => {
      const lineTotal = object.quantity.mul(object.unitPrice);
      total = total.add(lineTotal);
      return { ...toResponse(object), lineTotal: toMoney(lineTotal) };
    });

    return {
      article: { id: article.id, code: article.code, title: article.title },
      currency: CURRENCY,
      objects: rows,
      total: toMoney(total),
    };
  }

  private async findExisting(id: string) {
    const object = await this.prisma.drawingObject.findUnique({ where: { id } });
    if (!object) {
      throw new NotFoundException(`Object ${id} not found`);
    }
    return object;
  }

  private async checkArticleExists(articleId: number) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new BadRequestException(`Article ${articleId} does not exist`);
    }
  }
}

// Prisma returns Decimal values, which JSON would turn into strings; the API returns numbers.
function toResponse(object: DrawingObject) {
  return {
    ...object,
    unitPrice: toMoney(object.unitPrice),
    quantity: object.quantity.toNumber(),
  };
}
