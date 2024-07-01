export function render( results: CityMeasurements ) {
	const cities = Object.keys( results )
		.sort()
		.map( city => {
			let min = ( results[ city ][ 0 ] / 10 ).toFixed( 1 );
			let max = ( results[ city ][ 1 ] / 10 ).toFixed( 1 );

			const total = results[ city ][ 2 ] / 10;
			const count = results[ city ][ 3 ];

			let mean = ( total / count ).toFixed( 1 );

			if ( min === '-0.0' ) min = '0.0';
			if ( max === '-0.0' ) max = '0.0';
			if ( mean === '-0.0' ) mean = '0.0';

			return `${city}=${min}/${mean}/${max}`;
		} );

	return `{${cities.join( ', ' )}}`;
}
