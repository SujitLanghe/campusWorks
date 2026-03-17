import {v2 as cloud} from "cloudinary"
import fs from "fs"

cloud.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_KEY,
    api_secret : process.env.CLOUD_SECRET,
});
const uploadResult = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        const res = await cloud.uploader.upload(localFilePath,{
            resource_type : "auto",
        })
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return res;
    }
    catch(error){
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null
    }
};

export {uploadResult}
