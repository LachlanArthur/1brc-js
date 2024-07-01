/// <reference lib="webworker" />

import { CityParserTransformer } from "./city-parser-transformer";

const textDecoder = new TextDecoderStream();
const parserStream = new TransformStream( new CityParserTransformer() );

textDecoder.readable.pipeTo( parserStream.writable );

const read = parserStream.readable;
const write = textDecoder.writable;

postMessage( { read, write }, [ read, write ] );
