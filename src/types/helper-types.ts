
export type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

export type MapValue<T> = T extends Map<string, infer P> ? P : never
