/**
 * 检测提交路径模块
 */
exports.run = function(args){

	// 定义模块名 & 引入父模块资源、API
	var modName = args.modName,
			$P = module.parent.exports,
			config = $P.config,
			temp = $P.temp,
			alert = $P.alert,
			debugAlert = $P.debugAlert,
			objectCount = $P.objectCount,
			svnItemsFilter = $P.svnItemsFilter,
			nodePath = $P.nodePath;
			extend = $P.extend,
			MissionsClass = $P.MissionsClass,
			hookChecksMissions = $P.hookChecksMissions;

	// 获取配置
	var validateConfigs = config.validateConfigs[modName];
	
	// 准备出错容器
	var resultObj = temp.hookValidatorsResult[modName] = {};
	
		
	debugAlert("================================\nCHECK " + modName + " START\n================================");
		
	// 遍历规则配置
	for(var key in validateConfigs){
		
		// 获取配置
		var validateConfig = validateConfigs[key];
		
		// 准备错误容器结构
		resultObj[key] = {};
		resultObj[key].ruleName = validateConfig.ruleName;
		resultObj[key].warnning = validateConfig.warnning;
		resultObj[key].warnningItems = [];
		
		// 使用temp.commitItems组合出完整的filter
		validateConfig.filter = extend(true, validateConfig.filter, { items : temp.commitItems } );
		
		// 开始过滤
		var filtedItems = svnItemsFilter(validateConfig.filter);
	
		// 遍历过滤后的文件
		for(var filtedItem in filtedItems){
			
			// 取得文件路径
			var fPath = filtedItems[filtedItem].path;
			
			// 生成校验路径
			var validatePath = nodePath.basename(fPath);

			// 生成正则表达式
			var regx = new RegExp(validateConfig.validateRule);
			
			// 如果不符合规则
			if( !regx.test(validatePath) ){
				// 文件检测报警 收纳进出错容器
				resultObj[key].warnningItems.push({ "path" : fPath });
				// 影响打断本次提交
				temp.finalPassFlag = false;
			}
			
		}
		
	}
	
	// 如果有错误 且远端服务器无法连接 拼接字符串出错字段
	if(temp.finalPassFlag === false){
		resultObjForConsole = temp.hookValidatorsResultForConsole[modName] = [];
		// resultObjForConsole.push( "+--[ CHECK PATH MODULE ]" );
		for(var ruleKey in resultObj){
			if(resultObj[ruleKey].warnningItems.length > 0){
				// resultObjForConsole.push( "+----[ " + resultObj[ruleKey].ruleName + " ]" );
				var warnningItems = resultObj[ruleKey].warnningItems;
				resultObjForConsole.push( "-----------------------------------------------------------------------\n" + resultObj[ruleKey].warnning + "\n[" );
				for(var itemKey in warnningItems){
					resultObjForConsole.push( "- " + warnningItems[itemKey].path);
				}
				resultObjForConsole.push( "]" );
			}
		}
		
		temp.hookValidatorsResultForConsole[modName] = resultObjForConsole.join("\n");
	}
	
	
	debugAlert("================================\nCHECK " + modName + " END\n================================");
	hookChecksMissions.complete();
	
};