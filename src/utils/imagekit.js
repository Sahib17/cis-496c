import ImageKit from "imagekit";
import env from "../config/env.js";

const imagekit = new ImageKit({
    publicKey: env.IMGKIT_PUBLIC,
    privateKey: env.IMGKIT_PRIVATE,
    urlEndpoint: env.IMGKIT_ENDPOINT,
})

export default imagekit;