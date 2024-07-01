export class ChunkAlignTransformer implements Transformer<string, string> {
	protected leftovers: string[] = [];

	constructor(
		protected endText: string,
	) { }

	start() {
		this.leftovers = [];
	}

	transform( chunk: string, controller: TransformStreamDefaultController<string> ) {
		const endPosition = chunk.lastIndexOf( this.endText );

		if ( endPosition === -1 ) {
			this.leftovers.push( chunk );
		} else {
			controller.enqueue( this.leftovers.join( '' ) + chunk.substring( 0, endPosition + this.endText.length ) );

			this.leftovers = [];

			if ( chunk.length !== endPosition + this.endText.length ) {
				this.leftovers.push( chunk.substring( endPosition + this.endText.length ) );
			}
		}
	}

	flush( controller: TransformStreamDefaultController<string> ) {
		controller.enqueue( this.leftovers.join( '' ) );
	}
}
