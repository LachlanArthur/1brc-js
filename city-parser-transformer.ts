export class CityParserTransformer implements Transformer<string, CityMeasurements> {
	transform( chunk: string, controller: TransformStreamDefaultController<CityMeasurements> ) {
		const storage: CityMeasurements = {};

		for ( const matches of chunk.matchAll( /^([^;]+);(-?\d?\d\.\d)$/gm ) ) {
			const city = matches[ 1 ];
			const temp = Number( matches[ 2 ].replace( '.', '' ) );

			storage[ city ] ??= [ temp, temp, 0, 0 ];

			storage[ city ][ 0 ] = Math.min( storage[ city ][ 0 ], temp );
			storage[ city ][ 1 ] = Math.max( storage[ city ][ 1 ], temp );
			storage[ city ][ 2 ] += temp;
			storage[ city ][ 3 ]++;
		}

		controller.enqueue( storage );
	}
}
