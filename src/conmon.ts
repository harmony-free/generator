import { PLUGIN_ID } from "./Constants";


export function log(msg: string) {
    console.log(PLUGIN_ID + "：" + msg)
}