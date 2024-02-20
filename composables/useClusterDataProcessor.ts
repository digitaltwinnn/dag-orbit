import nodeDataProcessor from "~/assets/workers/processNodeData?worker";

/**
 * Creates a web worker to processes cluster data in the background.
 * @param nodes - The array of L0Node objects.
 * @param colors - The array of colors.
 * @returns An object containing the processed cluster data.
 */
export const useClusterDataProcessor = (nodes: L0Node[], colors: string[]) => {
  const clusterDataFromWorker = async (nodes: L0Node[]): Promise<NodeData> => {
    return new Promise((resolve, reject) => {
      const worker = new nodeDataProcessor();
      worker.postMessage({ nodes: toRaw(nodes), colors: toRaw(colors) });
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
