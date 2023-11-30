// export R# package module type define for javascript/typescript language
//
//    imports "CFD" from "CFD_clr";
//
// ref=CFD_clr.Rscript@CFD_clr, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null

/**
*/
declare namespace CFD {
   /**
   */
   function create_session(): any;
   module open {
      /**
        * @param mode default value Is ``null``.
        * @param env default value Is ``null``.
      */
      function pack(file: any, mode?: object, env?: object): object|object;
   }
}
