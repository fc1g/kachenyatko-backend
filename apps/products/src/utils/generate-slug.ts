import { nanoid } from 'nanoid';
import slugify from 'slugify';

type GenerateSlugOptions = {
  name: string;
  customSlug?: string;
  size?: string;
  material?: string;
  ageGroup?: string;
  withRandomSuffix?: boolean;
};

export const generateSlug = ({
  name,
  customSlug,
  size,
  material,
  ageGroup,
  withRandomSuffix = false,
}: GenerateSlugOptions): string => {
  const parts = [
    customSlug ? customSlug : name,
    size,
    material,
    ageGroup?.replace('+', 'plus'),
  ];

  const base = slugify(parts.filter(Boolean).join(' '), {
    lower: true,
    strict: true,
    replacement: '-',
  });

  return withRandomSuffix ? `${base}-${nanoid(6)}` : base;
};
