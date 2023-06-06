import clusterDataProcessor from "~/assets/workers/clusterDataProcessor?worker";

export const useCluster = (colors: string[]) => {
  const settings = {
    url: "/api/nodes",
    colors: colors,
    globe: {
      radius: 120,
      satellite: {
        proximity: 0.1,
      },
    },
    graph: {
      scale: 20,
    },
  };

  const clusterDataFromWorker = async () => {
    // get the nodes in the L0 cluster
    const nodes = await $fetch(settings.url);

    // start a worker to prepare the data
    return new Promise((resolve, reject) => {
      const worker = new clusterDataProcessor();
      worker.postMessage({ nodes: nodes, settings: settings });
      worker.addEventListener(
        "message",
        (e: { data: unknown }) => {
          if (e.data) {
            resolve(e.data);
            worker.terminate();
          }
        },
        false
      );
    });
  };

  const satellites: Satellite[] = [];
  const edges: Edge[] = [];

  const loaded = ref(false);
  const load = async () => {
    const data: any = await clusterDataFromWorker();
    satellites.push(...data.satellites);
    edges.push(...data.edges);
    loaded.value = true;
  };
  load();

  return {
    satellites,
    edges,
    loaded,
  };
};
