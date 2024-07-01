export class CityReduceTransformer implements Transformer<CityMeasurements, CityMeasurements> {
	protected totals: CityMeasurements = {};

	start() {
		this.totals = {};
	}

	transform( chunk: CityMeasurements ) {
		for ( const [ city, [ min, max, total, count ] ] of Object.entries( chunk ) ) {
			this.totals[ city ] ??= [ min, max, 0, 0 ];

			this.totals[ city ][ 0 ] = Math.min( this.totals[ city ][ 0 ], min );
			this.totals[ city ][ 1 ] = Math.max( this.totals[ city ][ 1 ], max );
			this.totals[ city ][ 2 ] += total;
			this.totals[ city ][ 3 ] += count;
		}
	}

	flush( controller: TransformStreamDefaultController<CityMeasurements> ) {
		controller.enqueue( this.totals );
	}
}
