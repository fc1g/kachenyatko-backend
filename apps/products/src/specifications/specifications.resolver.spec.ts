import { Test, TestingModule } from '@nestjs/testing';
import { SpecificationsResolver } from './specifications.resolver';
import { SpecificationsService } from './specifications.service';

describe('SpecificationsResolver', () => {
  let resolver: SpecificationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpecificationsResolver, SpecificationsService],
    }).compile();

    resolver = module.get<SpecificationsResolver>(SpecificationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
