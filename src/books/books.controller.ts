import { GetBookByIdDto } from './dto/get-book-by-id.dto';
import { GetBookDto } from './dto/get-book.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Book')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  findAll(@Query() query: GetBookDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }
  @Get('findbyuserid/:id')
  // @ApiConsumes('multipart/form-data')
  findByUserId(
    @Param('id') id: string,
    @Query() getBookByIdDto: GetBookByIdDto,
  ) {
    return this.booksService.findByUserId(id, getBookByIdDto);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

}
