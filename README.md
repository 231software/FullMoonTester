# FullMoonTester
A project tests all fmplib APIs. It uses as much fmplib APIs and check whether they work correctly.

This plugin can also be used for testing the stability of your server. 

[简体中文](README_zh_cn.md)

## Usage

> [!WARNING]  
> Before running your server with this plugin, you should backup all your data first, as this plugin is likely to **MAKE DESTRUCTIVE MODIFICATIONS** in your server!

### Test fmplib APIs

1. Prepare an environment as new as possible. For example, you'd better install a brand new server only with this plugin and its requirements. The server shouldn't have any existing data. 
2. 
  - If you want to test all fmplib APIs, please directly start the server. 
  - If you want to test specified APIs, open or create this plugin's data folder, create a file named config.json, and write the following into it:
```json
{
    "tested_apis":{
        "mode":"whitelist",
        "list":[
            //Write the APIs you want to test here and delete this annotation-like text
        ]
    }
}
```
  start your server after editing and saving the required file above. 
3. Join the server and do those actions following the instructions in game. The whole test may be stopped prematurely due to unrecoverable error.
4. After all the tests are done, check the server console to learn about which APIs are working incorrectly. 

### Test server stability

1. **Backup your server data first!!!**
2. 
  - If you want to test all fmplib APIs, please directly start the server. 
  - If you want to test specified APIs, open or create this plugin's data folder, create a file named config.json, and write the following into it:
```json
{
    "tested_apis":{
        "mode":"whitelist",
        "list":[
            //Write the APIs you want to test here and delete this annotation-like text
        ]
    }
}
```
  start your server after editing and saving the required file above. 
3. Join the server and do those actions following the instructions in game. The whole test may be stopped prematurely due to unrecoverable error.
4. After all the tests are done, check the server console to learn about which APIs are working incorrectly. 