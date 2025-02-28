function RenderContent({
  selectedFile,
  fileContent,
}: {
  selectedFile: string;
  fileContent: string;
}) {
  return (
    <div className="p-4 bg-gray-800 text-gray-200 rounded-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">{selectedFile}</h2>
      <pre className="text-sm whitespace-pre-wrap">{fileContent}</pre>
    </div>
  );
}

export default RenderContent;
