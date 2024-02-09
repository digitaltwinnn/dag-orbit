import nodeDataProcessor from "~/assets/workers/processNodeData?worker";

export const useClusterDataProcessor = (nodes: L0Node[], colors: string[]) => {
  const clusterDataFromWorker = async (nodes: L0Node[]): Promise<NodeData> => {
    // start a worker to prepare the data
    return new Promise((resolve, reject) => {
      const worker = new nodeDataProcessor();
      worker.postMessage({ nodes: nodes, colors: colors });
      worker.addEventListener(
        "message",
        (e: { data: NodeData }) => {
          if (e.data) {
            resolve(e.data);
            worker.terminate();
          }
        },
        false
      );
      worker.addEventListener("error", (error) => {
        reject(new Error("Worker error: " + error.message));
      });
    });
  };

  const satellites: Satellite[] = [];
  const satelliteEdges: Edge[] = [];
  const graphEdges: Edge[] = [];

  const loaded = ref(false);
  const load = async () => {
    const data = await clusterDataFromWorker(nodes);
    satellites.push(...data.satellites);
    satelliteEdges.push(...data.satelliteEdges);
    graphEdges.push(...data.graphEdges);
    loaded.value = true;
  };
  load();

  return {
    satellites,
    satelliteEdges,
    graphEdges,
    loaded,
  };
};
