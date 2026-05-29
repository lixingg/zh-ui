export * from "./global"
declare module 'some-library' {
    interface SomeInterface {
        newMethod(): void
    }
}
