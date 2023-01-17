//require('ZHSubAppUtils');
//defineClass('ZHSubAppUtils', {} ,{
//    clearSave: function() {
//        ZHSubAppUtils.sharedInstance().clearSave();
//    },
//});

require('AppDelegate,ZHDataReportManager,RCEMediator,ZHUserManager,WKWebsiteDataStore,NSDate,ZHBaseProcessPoolUtil,RCEKeychainUtility,RCEUserManager,NSString,ZHDataReportManager,ZHUncaughtExceptionHandler');
defineClass('AppDelegate',{

    onLogout: function(notification) {

        dispatch_async_main(function(){
            ZHDataReportManager.reportAllSaveInfo();
        });
        
//        RCEMediator.sharedInstance().HWMeeting_logoutCompletion(block('NSError*,id', function(error, res) {
//            NSLog("退出登录");
//        }));
//        dispatch_async_main(function(){
//            //清空百宝箱给h5存的数据
//            ZHUserManager.sharedManager().clearPublicInfoForH5();
//            //清空webview所有缓存
//            var websiteDataTypes = WKWebsiteDataStore.allWebsiteDataTypes();
//            var dateFrom = NSDate.dateWithTimeIntervalSince1970(0);
//            WKWebsiteDataStore.defaultDataStore().removeDataOfTypes_modifiedSince_completionHandler(websiteDataTypes, dateFrom, block(function() {}));
//            ZHBaseProcessPoolUtil.sharedInstance().destroyInstance(); //销毁缓存池，否则清理需要重启才生效
//        });

    },
appConfig_launch_handler: function(vc, isLaunch, appConfig) {
    var reportMode = appConfig.body().reportMode();
    //    "1,3" 1为启动上报 3应用唤起时上报
    var userName = RCEKeychainUtility.RCEDataForKey("RCEUserName");
    var userInfo = RCEUserManager.sharedManager().getUserInfo(userName);
    if (userInfo) {
        ZHDataReportManager.setEmail(userInfo.email());
          var userType = userInfo.extra2();
          ZHDataReportManager.setUserType(userType.toString());
        if (isLaunch) {
            if (reportMode.containsString("1")) {
                ZHDataReportManager.reportAllSaveInfo();
                ZHUncaughtExceptionHandler.report();
            }
        } else {
            if (reportMode.containsString("3")) {
                ZHDataReportManager.reportAllSaveInfo();
                ZHUncaughtExceptionHandler.report();
            }
        }
    }
},

});
require('ZHUserManager,XMCenter,ZHSinochemUser,NSDictionary,HUDUtil,NSMutableDictionary,NSString,ZHSubAppUtils,NSArray,ZHSubAppModel');
defineClass('Target_Chat', {
    commitQR: function(qrParams) {
        ZHUserManager.sharedManager().getHuaxiaoyiOauthTokenIfNeed(block('ZHOauthInfo*', function(userinfo) {
            var center = XMCenter.center();
            center.setConsoleLog(YES);

            center.sendRequest_onSuccess_onFailure(block('XMRequest*', function(request) {


                var oauthToken = ZHSinochemUser.shareInstance().oauth().access_token();
                var IAMToken = ZHSinochemUser.shareInstance().IAMToken();

                //        weakSelf.ZHOAOauthToken() = oauthToken;
                //        weakSelf.ZHOAIAMToken() = IAMToken;
                var bundleId = "09d04f61-e399-4568-8736-38916e9032ac";
                var qrToken = qrParams.objectForKey('QRToken');
                var type = qrParams.objectForKey('type');
                var content = qrParams.objectForKey('content');

                var params = {
                    "appId": bundleId,
                    "oauthToken": oauthToken,
                    "iamToken": IAMToken,
                    "qrToken" : qrToken ? qrToken : "",
                    "type" : type ? type : "",
                    "content" : content ? content : {}
                };

                //                    request.server() = "http://106.120.70.74/ngx425/qrcode/";

                request.setServer("https://mobile.sinochem.com/qrcode/");
                request.setApi("commitQR");
                request.setHttpMethod(1);
                request.setRequestSerializerType(1);
                request.setResponseSerializerType(1);
                request.setParameters(params);

            }), block('NSURLResponse*,NSDictionary*', function(response, responseObject) {

                if (responseObject && responseObject.isKindOfClass(NSDictionary.class())) {
                    var res = responseObject;
                    if (res){
                        var data = res.objectForKey('data');
                        if(data){
                            var action = data.objectForKey('action');
                            if (action.toJS() == "login" ) {
                                self.presentWebLoginViewController_andPlatform_type_params("", "", 1, {
                                    "result": responseObject
                                });
                                
                            }else if (action.toJS() == "alert" ) {
                                var content = data.objectForKey('content');
                                var message = content.objectForKey('message');
                                HUDUtil.showStr(message);
                            }else if (action.toJS() == "executeLocalMethod" ) {
                                var ownParam = data.objectForKey('ownParam');
                                var ownParamMessage = ownParam.objectForKey('message');
                                var clientId = ownParamMessage.objectForKey('clientid');
                                var type = ownParamMessage.objectForKey('type');
                                var widgetUrl = ownParamMessage.objectForKey('widgeturl');
                                var useIAM = ownParamMessage.objectForKey('useIAM');
                                var extra = data.objectForKey('content').toJS();
                                extra["name"] = "hxy_plus";

                                    //集成配置
                                    if (type.isEqualToString("integration")) {
                                        var widgetId = ownParamMessage.objectForKey('widgetid');
                                        var widgetUrl = ownParamMessage.objectForKey('widgeturl');
                                        var extraParams = widgetUrl.mj__JSONObject();
                                        if (!NSString.isStrictEmpty(widgetId)) {
                                            ZHSubAppUtils.sharedInstance().openIntegratConfigH5SubApp_extraParams(widgetId, extraParams);
                                        }

                                    } else if (type.isEqualToString("workbench")) {
                                        var widgetId = ownParamMessage.objectForKey('widgetid');
                                        var widgetUrl = ownParamMessage.objectForKey('widgeturl');
                                        var extraParams = widgetUrl.mj__JSONObject();
                                        
                                        
                                        if (widgetId) {
                                            var url = "https://mp.sinochem.com/cangqiong-gateway/openapi/workbench/apps";
                                XMCenter.centerInId("ZHSinochem_cangqiong").sendRequest_onSuccess_onFailure(
                                            block('XMRequest*', function(request) {
                                                        request.setHttpMethod(1);
                                                        request.setParameters({
                                                                "ids": [widgetId]
                                                            });
                                                        request.setUrl(url);
                                                        request.setRequestSerializerType(1);
                                                    }),
                                            block('NSURLResponse*,NSDictionary*', function(response, responseObject) {
                                                        var code = responseObject.objectForKey("code");
                                                        var body = responseObject.objectForKey("body");
                                                        if (code == 2000 ) {
                                                            console.log("2000--1214001",responseObject);
                                                            if (body && body.isKindOfClass(NSArray.class())){
                                                                console.log("2000-1--1214001",responseObject);
                                                                var subListArr = NSArray.yy__modelArrayWithClass_json(ZHSubAppModel.class(),body);
                                                                
                                                                if (subListArr.isKindOfClass(NSArray.class())) {
                                                                    var subApps = subListArr;
                                                                    if (subApps.count() > 0) {
                                                                        ZHSubAppUtils.sharedInstance().subAppDidSelect_extraParams(subApps.firstObject(), extraParams);
                                                                    }
                                                                }
//                                                                successBlock(response,subListArr)

                                //                                block('response,subListArr',successBlock);
                                                            }
                                                        } else {
                                                            console.log("no2000--1214001",responseObject);
                                                            if (responseObject.isKindOfClass(NSArray.class())) {
                                                                var subApps = responseObject;
                                                                if (subApps.count() > 0) {
                                                                    ZHSubAppUtils.sharedInstance().subAppDidSelect_extraParams(subApps.firstObject(), extraParams);
                                                                }
                                                            }
//                                                            successBlock(response,subListArr)

                                //                            block('response,responseObject',successBlock);
                                                        }
                                                    }),
                                            block('NSURLResponse*,NSError*', function(response, error) {
                                                        console.log("mainjs搜索子应用失败，请稍后重试",error);
                                                        HUDUtil.showStr("加载失败，请稍后重试");
                                            }));
                                        }
                                        
                                        
//                                        ZHSubAppUtils.sharedInstance().loadSubAppInfoBySearchId_onSuccess([widgetId], block('NSURLResponse*,NSArray*', function(response, responseObject) {
//                                            if (responseObject.isKindOfClass(NSArray.class())) {
//                                                var subApps = responseObject;
//                                                if (subApps.count() > 0) {
//                                                    ZHSubAppUtils.sharedInstance().subAppDidSelect_extraParams(subApps.firstObject(), extraParams);
//                                                }
//                                            }
//                                        }));
                                    }else {
                                        var model = ZHSubAppModel.alloc().init();

                                        if (useIAM) {
                                            model.setSubAppAuthType(2);
                                        } else {
                                            model.setSubAppAuthType(1);
                                        }
                                        if (type.isEqualToString("H5")) {
                                            model.setShowNativeHeader(YES);
                                        } else if (type.isEqualToString("H5_NH")) {
                                            model.setShowNativeHeader(NO);
                                        }
                                        model.setSubAppType(1);
                                        model.setClientid(clientId);
                                        model.setEntry(widgetUrl);
                                        ZHSubAppUtils.sharedInstance().subAppDidSelect_extraParams(model, extra);
                                    }
                            }
                        }
                    }
                }
            }), block('NSURLResponse*,NSError*', function(response, error) {

          }));
      }));
    },
});

//require('ZHSubAppUtils,XMNetworking,XMConst,XMCenter,NSDictionary,HUDUtil,NSMutableDictionary,NSString,NSArray,ZHSubAppModel');
//defineClass('ZHSubAppUtils', {
//loadSubAppInfoBySearchId_onSuccess: function(subIds, successBlock) {
//        if (subIds) {
//            var url = "https://mp.sinochem.com/cangqiong-gateway/openapi/workbench/apps";
//XMCenter.centerInId("ZHSinochem_cangqiong").sendRequest_onSuccess_onFailure(
//            block('XMRequest*', function(request) {
//                        request.setHttpMethod(1);
//                        request.setParameters({
//                                "ids": subIds
//                            });
//                        request.setUrl(url);
//                        request.setRequestSerializerType(1);
//                    }),
//            block('NSURLResponse*,NSDictionary*', function(response, responseObject) {
//                        var code = responseObject.objectForKey("code");
//                        var body = responseObject.objectForKey("body");
//                        if (code == 2000 ) {
//                            console.log("2000--1214001",responseObject);
//                            if (body && body.isKindOfClass(NSArray.class())){
//                                console.log("2000-1--1214001",responseObject);
//                                var subListArr = NSArray.yy__modelArrayWithClass_json(ZHSubAppModel.class(),body);
//                                successBlock(response,subListArr)
//
////                                block('response,subListArr',successBlock);
//                            }
//                        } else {
//                            console.log("no2000--1214001",responseObject);
//                            successBlock(response,subListArr)
//
////                            block('response,responseObject',successBlock);
//                        }
//                    }),
//            block('NSURLResponse*,NSError*', function(response, error) {
//                        console.log("mainjs搜索子应用失败，请稍后重试",error);
//                        HUDUtil.showStr("加载失败，请稍后重试");
//            }));
//        }
//},
//});


