export interface DestinationImage {
  id: string;
  title: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  creator: string | null;
  license: string | null;
  licenseUrl: string | null;
  sourceUrl: string;
  description: string | null;
}

export interface ImagesResponse {
  success: boolean;
  destination: string;
  count: number;
  images: DestinationImage[];
  message?: string;
}
