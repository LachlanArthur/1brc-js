/// <reference lib="webworker" />

const stream = new TransformStream( {
	transform( chunk, controller ) {
		controller.enqueue( chunk );
	},
} );

postMessage( 'stream', [ stream ] );
