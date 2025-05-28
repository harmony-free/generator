
import { hvigor, HvigorNode, HvigorPlugin  } from '@ohos/hvigor';
import { OhosHapContext, OhosHarContext, OhosHspContext, OhosPluginId } from '@ohos/hvigor-ohos-plugin';
import { log } from './conmon';

// HMRouterPluginMgr class, used to manage HMRouterPluginHandle instances
class HMRouterPluginMgr {
  // Collection of HMRouterPluginHandle instances
  hmRouterPluginSet: Set<string> = new Set();

  // Constructor, start all HMRouterPluginHandle instances after the hvigor node evaluation, and delete the generated files upon hvigor build completion
  constructor() {
    hvigor.nodesEvaluated(() => {
      this.hmRouterPluginSet.forEach((pluginHandle) => {
        log("工程id-" + pluginHandle);
      });
    });
    hvigor.buildFinished(() => {
      log('buildFinished deleteFile exec...');
    });
  }

  // Register HMRouterPluginHandle instance
  registerHMRouterPlugin(node: HvigorNode, pluginId: string) {

    const moduleContext = node.getContext(pluginId) as OhosHapContext | OhosHarContext | OhosHspContext;

    if (!moduleContext) {
      log("error-moduleContext is null-" + node.getNodePath());
      throw new Error('moduleContext is null');
    }
    // let pluginHandle = new HMRouterPluginHandle(node, moduleContext);

    this.hmRouterPluginSet.add(pluginId);
  }

}

// HMRouterPluginMgr instance
let HMRouterPluginMgrInstance: HMRouterPluginMgr | null = null;

export function genIndex(): HvigorPlugin {
  return {
    pluginId: "genIndex",
    apply(node: HvigorNode) {
      // If the HMRouterPluginMgr instance is null, create a new instance
      if (!HMRouterPluginMgrInstance) {
        HMRouterPluginMgrInstance = new HMRouterPluginMgr();
      }
      // register HMRouterPluginHandle instance
      HMRouterPluginMgrInstance.registerHMRouterPlugin(node,OhosPluginId.OHOS_HAR_PLUGIN);
    }
  };
}

// hap plugin
export function hapPlugin(): HvigorPlugin {
  return {
    pluginId: "HAP_HMROUTER_PLUGIN",
    apply(node: HvigorNode) {
      // If the HMRouterPluginMgr instance is null, create a new instance
      if (!HMRouterPluginMgrInstance) {
        HMRouterPluginMgrInstance = new HMRouterPluginMgr();
      }
      // Register the HMRouterPluginHandle instance
      HMRouterPluginMgrInstance.registerHMRouterPlugin(node, OhosPluginId.OHOS_HAP_PLUGIN);
    }
  };
}

// hsp plugin
export function hspPlugin(): HvigorPlugin {
  return {
    pluginId: "HSP_HMROUTER_PLUGIN",
    apply(node: HvigorNode) {
      // If the HMRouterPluginMgr instance is null, create a new instance
      if (!HMRouterPluginMgrInstance) {
        HMRouterPluginMgrInstance = new HMRouterPluginMgr();
      }
      // register HMRouterPluginHandle instance
      HMRouterPluginMgrInstance.registerHMRouterPlugin(node, OhosPluginId.OHOS_HSP_PLUGIN);
    }
  };
}

// har plugin
export function harPlugin(): HvigorPlugin {
  return {
    pluginId: "HAR_HMROUTER_PLUGIN",
    apply(node: HvigorNode) {
      // If the HMRouterPluginMgr instance is null, create a new instance
      if (!HMRouterPluginMgrInstance) {
        HMRouterPluginMgrInstance = new HMRouterPluginMgr();
      }
      // register HMRouterPluginHandle instance
      HMRouterPluginMgrInstance.registerHMRouterPlugin(node, OhosPluginId.OHOS_HAR_PLUGIN);
    }
  };
}