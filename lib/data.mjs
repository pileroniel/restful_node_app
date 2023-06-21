/**
 * Library for storing and editing data files in the .data private folder
 * Handles all CRUD operations in the respective create,read,update and delete lib functions
 */

//dependencies

import fs from 'fs'
 import path from 'path'
import { fileURLToPath } from 'url';

///write data to a file
let lib = {}

//current working directory
let currentModule = import.meta.url //retreives this module-url
let currentPath = fileURLToPath(currentModule) //convert this module-url to the exact file path
let currDir = path.dirname(currentPath)//gets the directory/folder name


// base directory 
lib.baseDir = path.join(currDir, "../.data");

//create JSON file based on what the name of the directory/folder and fileName specified by the user
lib.create = (folder, file,data, callback )=>{
    //open or create file that didn't exist(using wx flag)
    fs.open(`${lib.baseDir}/${folder}/${file}.json`,'wx',(err, fileDescriptor)=>{
        if( !err && fileDescriptor){
            //convert data to string
            const dataToString = JSON.stringify(data)

            //write to file 
            fs.writeFile(fileDescriptor,dataToString,(err)=>{
                if(!err){
                    fs.close(fileDescriptor, (err)=>{
                        if(!err)
                        {
                            callback(false);//false error
                        }
                        else{
                            callback(`Error closing the ${file}.json file`);
                        }
                    })
                }
                else{
                    callback(`Error writing to the ${file}.json file`);
                }
            })

        }else{
            callback(`Can't create file ${file}.json since it already exists in lib/${folder}`)
        }
    } )



}

//read an existing file

lib.read=(folder,file,callback)=>{
    fs.readFile(`${lib.baseDir}/${folder}/${file}.json`, {encoding:'utf-8',flag:'r'}, (err,data)=>{
        callback(err,data)
    })
}

//update an existing file with data

lib.update= (folder,file,data,callback) =>{
    fs.open(`${lib.baseDir}/${folder}/${file}.json`,'r+', (err,fileDescriptor) =>{
        if(!err && fileDescriptor)
        {
            const dataToString = JSON.stringify(data);

            //truncate the file before you write on top of it (is this really necessary?)
            fs.truncate(fileDescriptor, (err) =>{
                if(!err){
                //write to the file and close it
                    fs.writeFile(fileDescriptor, dataToString,(err) =>{
                        if(!err){
                            //close the file
                            fs.close(fileDescriptor,(err) =>{
                                if(!err){
                                    callback(false) //false error, i.e no error being called
                                }else{
                                    callback(`Could not close ${file}.json after updating its contents`);
                                }
                            } )
                        }else{
                            callback(`Error writing to ${file}.json`);
                        }
                    } )
                }else{
                    callback("Error truncating the file")
                }
            }) 

        }else{
            callback(
              `Could not open ${file}.json for updating, it doesn't exist`
            );
        }



    } )
} 

lib.delete=(folder,file,callback) =>{
    //unlink the file
    fs.unlink(`${lib.baseDir}/${folder}/${file}.json`,(err) =>{
        if(!err){
            callback(false)
        }else{
            callback("Error Deleting File")
        }
    } )
} 

export default lib