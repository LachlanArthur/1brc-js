import { ChunkAlignTransformer } from "./chunk-align-transformer.ts";

// const file = await Deno.open( './measurements-1000000.txt' );
const file = await Deno.open( './measurements-10000000.txt' );
// const file = await Deno.open( './measurements-1000000000.txt' );

const stream = file.readable
	.pipeThrough( new TextDecoderStream() )
	.pipeThrough( new TransformStream( new ChunkAlignTransformer( '\n' ) ) );

const storage: Record<string, [ number, number, number, number ]> = {}; // [ min, max, total, count ]

let lines = 0;
for await ( const chunk of stream ) {
	for ( const matches of chunk.matchAll( /^([^;]+);(-?\d?\d\.\d)$/gm ) ) {
		lines++;
		const city = matches[ 1 ];
		const temp = Number( matches[ 2 ].replace( '.', '' ) );

		// Assume we've seen all the cities by this point
		lines < 100_000 && ( storage[ city ] ??= [ temp, temp, 0, 0 ] );

		storage[ city ][ 0 ] = Math.min( storage[ city ][ 0 ], temp );
		storage[ city ][ 1 ] = Math.max( storage[ city ][ 1 ], temp );
		storage[ city ][ 2 ] += temp;
		storage[ city ][ 3 ]++;
	}
}

const output = `{${Object.keys( storage )
	.sort()
	.map( city => {
		let min = ( storage[ city ][ 0 ] / 10 ).toFixed( 1 );
		let max = ( storage[ city ][ 1 ] / 10 ).toFixed( 1 );

		const total = storage[ city ][ 2 ] / 10;
		const count = storage[ city ][ 3 ];

		let mean = ( total / count ).toFixed( 1 );

		if ( min === '-0.0' ) min = '0.0';
		if ( max === '-0.0' ) max = '0.0';
		if ( mean === '-0.0' ) mean = '0.0';

		return `${city}=${min}/${mean}/${max}`;
	} )
	.join( ', ' )}}`;

console.log( output );

// console.assert( output === Deno.readTextFileSync( './measurements-1000000.out' ) );
console.assert( output === Deno.readTextFileSync( './measurements-10000000.out' ) );
// console.assert( output === Deno.readTextFileSync( './measurements-1000000000.out' ) );
