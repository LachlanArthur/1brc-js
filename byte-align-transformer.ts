export class ByteAlignTransformer implements Transformer<Uint8Array, Uint8Array> {
	protected leftovers: Uint8Array[] = [];

	constructor(
		protected endByte: number,
	) { }

	start() {
		this.leftovers = [];
	}

	transform( chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array> ) {
		const endPosition = chunk.lastIndexOf( this.endByte );

		if ( endPosition === -1 ) {
			this.leftovers.push( chunk );
		} else {
			const leftovers = this.joinLeftovers();
			const combined = new Uint8Array( leftovers.length + endPosition + 1 );

			combined.set( leftovers, 0 );
			combined.set( chunk.slice( 0, endPosition + 1 ), leftovers.length );

			controller.enqueue( combined );

			this.leftovers = [];

			if ( chunk.length !== endPosition + 1 ) {
				this.leftovers.push( chunk.slice( endPosition + 1 ) );
			}
		}
	}

	flush( controller: TransformStreamDefaultController<Uint8Array> ) {
		controller.enqueue( this.joinLeftovers() );
	}

	joinLeftovers() {
		if ( this.leftovers.length === 0 ) {
			return new Uint8Array( 0 );
		}

		if ( this.leftovers.length === 1 ) {
			return this.leftovers[ 0 ];
		}

		const leftoversSize = this.leftovers.reduce( ( acc, leftover ) => acc + leftover.length, 0 );
		const combined = new Uint8Array( leftoversSize );

		for ( let i = 0, cursor = 0; i < this.leftovers.length; i++, cursor += this.leftovers[ i ].length ) {
			combined.set( this.leftovers[ i ], cursor );
		}

		return combined;
	}
}
