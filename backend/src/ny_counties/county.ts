import type { Polygon, MultiPolygon } from 'geojson';

// export type Position = [number, number];

// export interface PolygonGeometry {
//   type: 'Polygon' | 'MultiPolygon';
//   coordinates: Position[][];
// }

// export interface MultiPolygonGeometry {
//   type: 'MultiPolygon';
//   coordinates: Position[][][];
// }

// export type Geometry = PolygonGeometry | MultiPolygonGeometry;

// export interface County {
//   name: string;
//   tax: number;
//   type: 'Feature';
//   geometry: Geometry;
//   properties: Record<string, unknown>;
// }

export type Geometry = Polygon | MultiPolygon;

export interface County {
  name: string;
  tax: number;
  type: 'Feature';
  geometry: Geometry;
  properties: Record<string, unknown>;
}
