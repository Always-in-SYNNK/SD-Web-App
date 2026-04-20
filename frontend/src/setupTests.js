import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "node:util";

if (typeof globalThis.TextEncoder === "undefined") {
	globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === "undefined") {
	globalThis.TextDecoder = TextDecoder;
}
