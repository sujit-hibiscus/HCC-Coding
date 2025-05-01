"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRedux } from "@/hooks/use-redux";
import { updatePdfFilters } from "@/store/slices/pdfFiltersSlice";
import { ProgressBar, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin, type ToolbarSlot } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import React, { type ReactElement, useEffect } from "react";

interface PdfViewerProps {
  url: string
  isViewer?: boolean
  isFlattened?: boolean
}

const PdfUI: React.FC<PdfViewerProps> = ({ url: urlData = "", isViewer = true }) => {
  const [url] = urlData.split("__");

  const { dispatch, selector } = useRedux();

  const savedFilters = selector((state) => state.pdfFilters[url]);
  const [currentPage, setCurrentPage] = React.useState<number>(savedFilters?.currentPage || 1);
  const [zoom, setZoom] = React.useState<number>(savedFilters?.zoom || 100);
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(savedFilters?.isDarkTheme || false);

  useEffect(() => {
    dispatch(
      updatePdfFilters({
        pdfUrl: url,
        filters: {
          currentPage,
          zoom,
          isDarkTheme,
        },
      }),
    );
  }, [currentPage, zoom, url, dispatch, isDarkTheme]);

  const renderToolbar = (Toolbar: (props: { children: (slots: ToolbarSlot) => ReactElement }) => ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        if (!slots) return <></>;

        const {
          CurrentPageInput,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Zoom,
          ZoomIn,
          ZoomOut,
          SwitchTheme,
          GoToLastPage,
          GoToFirstPage,
        } = slots;

        /*    const handleDownload = async () => {
             try {
               const response = await fetch(url);
               const pdfBytes = await response.arrayBuffer();
   
               if (isFlattened) {
                 const pdfDoc = await PDFDocument.load(pdfBytes);
                 const pages = pdfDoc.getPages();
                 pages.forEach((page) => {
                   page.setFontSize(12);
                 });
                 const flattenedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
                 const blob = new Blob([flattenedPdfBytes], { type: "application/pdf" });
                 const link = document.createElement("a");
                 link.href = URL.createObjectURL(blob);
                 link.download = name;
                 link.click();
               } else {
                 const blob = new Blob([pdfBytes], { type: "application/pdf" });
                 const link = document.createElement("a");
                 link.href = URL.createObjectURL(blob);
                 link.download = name;
                 link.click();
               }
             } catch (error) {
               console.error("Error downloading PDF:", error);
             }
           }; */

        return (
          <div className="flex items-center w-full px-2">
            <TooltipProvider>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <ZoomOut />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Zoom Out
                  </TooltipContent>
                </Tooltip>

                <div className="font-semibold">
                  <Zoom />
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <ZoomIn />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Zoom In
                  </TooltipContent>
                </Tooltip>
              </div>

              {/*  <Typography variant="description" className="pl-2">
                {name}
              </Typography> */}

              <div className="flex items-center gap-2 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <GoToFirstPage />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    First Page
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <GoToPreviousPage />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    Previous Page
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-2">
                  <div className="max-w-[80px]">
                    <CurrentPageInput />
                  </div>
                  <div>/</div>
                  <NumberOfPages />
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <GoToNextPage />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    Next Page
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <GoToLastPage />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Last Page
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <SwitchTheme />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    Switch Theme
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2">
                      <EnterFullScreen />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    Fullscreen
                  </TooltipContent>
                </Tooltip>

                {/*  <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer" onClick={handleDownload}>
                      <Download className="w-5 h-5 text-[#777777]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    Download PDF
                  </TooltipContent>
                </Tooltip> */}
              </div>
            </TooltipProvider>
          </div>
        );
      }}
    </Toolbar>
  );

  // Create plugins with event handlers
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]],
    renderToolbar,
  });

  return (
    <div className={`w-full border-none h-full rounded-md ${isDarkTheme ? "dark-theme" : "light-theme"}`}>
      {isViewer ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={url}
            initialPage={savedFilters?.currentPage ? savedFilters.currentPage - 1 : 0}
            defaultScale={savedFilters?.zoom ? savedFilters.zoom / 100 : 1}
            renderLoader={(percentages: number) => (
              <div className="w-[240px]">
                <ProgressBar progress={Math.round(percentages)} />
              </div>
            )}
            renderError={() => (
              <div className="flex items-center h-full justify-center min-h-[100px] text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Please select a document
                </h2>
              </div>
            )}
            theme={isDarkTheme ? "dark" : "light"}
            plugins={[defaultLayoutPluginInstance]}
            onPageChange={(page) => {
              setCurrentPage(page.currentPage + 1);
            }}
            onZoom={(newZoom) => {
              setZoom(newZoom?.scale * 100);
            }}
            onSwitchTheme={(theme) => {
              setIsDarkTheme(theme === "dark");
            }}
          />
        </Worker>
      ) : (
        <iframe title="pdf-viewer" src={url} width="100%" height="100%" loading="lazy" />
      )}
    </div>
  );
};

export default PdfUI;

