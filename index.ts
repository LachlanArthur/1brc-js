import { ChunkAlignTransformer } from "./chunk-align-transformer.ts";
import { CityParserTransformer } from "./city-parser-transformer.ts";
import { CityReduceTransformer } from "./city-reduce-transformer.ts";
import { render } from "./render.ts";

const file = await Deno.open( './measurements-1000000000.txt' );

await file.readable
	.pipeThrough( new TextDecoderStream() )
	.pipeThrough( new TransformStream( new ChunkAlignTransformer( '\n' ) ) )
	.pipeThrough( new TransformStream( new CityParserTransformer() ) )
	.pipeThrough( new TransformStream( new CityReduceTransformer() ) )
	.pipeTo( new WritableStream( {
		write( chunk ) {
			console.log( render( chunk ) );
		}
	} ) )
