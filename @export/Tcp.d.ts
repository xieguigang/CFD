// export R# package module type define for javascript/typescript language
//
//    imports "Tcp" from "CFD_clr";
//
// ref=CFD_clr.Tcp@CFD_clr, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null

/**
 * 
*/
declare namespace Tcp {
   /**
    * start the backend service
    * 
    * > the server thread will be blocked at here
    * 
     * @param debug_port 
     * + default value Is ``null``.
     * @param session_file 
     * + default value Is ``null``.
   */
   function start(debug_port?: object, session_file?: string): any;
}
