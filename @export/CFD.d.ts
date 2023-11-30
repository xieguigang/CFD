// export R# package module type define for javascript/typescript language
//
//    imports "CFD" from "CFD_clr";
//
// ref=CFD_clr.Rscript@CFD_clr, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null

/**
*/
declare namespace CFD {
   module open {
      /**
        * @param mode default value Is ``null``.
        * @param env default value Is ``null``.
      */
      function pack(file: any, mode?: object, env?: object): object|object;
   }
   module read {
      /**
      */
      function frameRaster(pack: object, time: object): any;
   }
   /**
     * @param dims default value Is ``'1920,1080'``.
     * @param env default value Is ``null``.
   */
   function session(storage: object, dims?: any, env?: object): object;
   /**
     * @param max_time default value Is ``1000000``.
   */
   function start(ss: object, max_time?: object): object;
}
