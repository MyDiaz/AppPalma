/* tslint:disable:no-namespace */

declare namespace google {
  namespace maps {
    class Map<T = HTMLElement> {
      constructor(mapDiv: Element | null, opts?: any);
      setCenter(center: any): void;
    }

    class KmlLayer {
      constructor(opts?: any);
      getDefaultViewport(): any;
    }

    namespace event {
      function addListener(
        instance: any,
        eventName: string,
        handler: (...args: any[]) => any
      ): any;
    }
  }
}
