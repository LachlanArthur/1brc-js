export type WorkerResponse = {
	read: ReadableStream<CityMeasurements>,
	write: WritableStream<Uint8Array>,
};

export class ParallelWorkerTransformer implements Transformer<Uint8Array, CityMeasurements> {
	protected workers: Worker[] = [];
	protected readStreams: ReadableStream<CityMeasurements>[] = [];
	protected writers: WritableStreamDefaultWriter<Uint8Array>[] = [];
	protected workersStarted: Promise<void>[] = [];
	protected workersDone: Promise<void>[] = [];
	protected chunkIndex = 0;

	async start( controller: TransformStreamDefaultController<CityMeasurements> ) {
		this.workers = [];
		this.readStreams = [];
		this.writers = [];
		this.workersDone = [];

		const workerUrl = new URL( './worker.js', import.meta.url );

		for ( let i = 0; i < navigator.hardwareConcurrency; i++ ) {
			const worker = new Worker( workerUrl, { type: 'module' } );

			const { resolve, promise } = Promise.withResolvers<void>();
			this.workersStarted.push( promise );

			worker.addEventListener( 'message', ( e: MessageEvent<WorkerResponse> ) => {
				const { read, write } = e.data;

				this.workers[ i ] = worker;
				this.readStreams[ i ] = read;
				this.writers[ i ] = write.getWriter();
				resolve();
			} );
		}

		await Promise.all( this.workersStarted );

		for ( const [ i, readStream ] of this.readStreams.entries() ) {
			this.workersDone[ i ] = readStream.pipeTo( new WritableStream( {
				write: chunk => controller.enqueue( chunk ),
			} ) );
		}
	}

	async transform( chunk: Uint8Array ) {
		const workerIndex = this.chunkIndex % this.workers.length;

		await this.writers[ workerIndex ].write( chunk );

		this.chunkIndex++;
	}

	async flush() {
		for ( const writer of this.writers ) {
			await writer.close();
		}

		await Promise.allSettled( this.workersDone );

		for ( const worker of this.workers ) {
			worker.terminate();
		}
	}
}
