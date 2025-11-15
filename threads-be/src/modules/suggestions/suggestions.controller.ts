import { Controller, Get } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get('suggestions')
  async getSuggestions(@CurrentUser() user: User) {
    return this.suggestionsService.getSuggestions(user.id, 25);
  }
}
