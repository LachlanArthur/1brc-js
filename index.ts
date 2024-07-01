import { ByteAlignTransformer } from "./byte-align-transformer.js";
import { CityReduceTransformer } from "./city-reduce-transformer.js";
import { ParallelWorkerTransformer } from "./parallel-worker-transformer.js";
import { render } from "./render.js";

const input = document.querySelector<HTMLInputElement>( 'input[type="file"]' )!;

input.addEventListener( 'change', () => {
	const file = input.files?.[ 0 ];
	if ( !file ) return;
	parse( file );
} );

async function parse( file: File ) {
	console.time( 'parse' );

	await file.stream()
		.pipeThrough( new TransformStream( new ByteAlignTransformer( 0x0A ) ) )
		.pipeThrough( new TransformStream( new ParallelWorkerTransformer() ) )
		.pipeThrough( new TransformStream( new CityReduceTransformer() ) )
		.pipeTo( new WritableStream( {
			write( chunk ) {
				console.log( render( chunk ) );
			}
		} ) )

	console.timeEnd( 'parse' );
}
