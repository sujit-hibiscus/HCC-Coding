"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRedux } from "@/hooks/use-redux";
import { updatePdfFilters } from "@/store/slices/pdfFiltersSlice";
import { ProgressBar, Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin, type ToolbarSlot } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import React, { type ReactElement, useEffect } from "react";
import { PreventSaveProvider } from "@/components/layout/prevent-save-provider";

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

  // Add CSS to disable text selection
  useEffect(() => {
    // Add a style tag to disable text selection in the PDF viewer
    const style = document.createElement("style");
    style.innerHTML = `
      .rpv-core__text-layer {
        user-select: none !important;
        pointer-events: none !important;
      }
      .rpv-core__text-layer span {
        user-select: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  // Create a character map that prevents text selection
  const characterMap = React.useMemo(() => {
    return {
      isCompressed: false,
      url: "",
      get: () => "",
    };
  }, []);

  return (
    <PreventSaveProvider>
      <div className={`w-full h-full border-none ${isDarkTheme ? "dark-theme" : "light-theme"}`}>
        {isViewer ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="h-full">
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
                    <h2 className="text-xl font-semibold text-gray-800">Please select a document</h2>
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
                characterMap={characterMap}
              />
            </div>
            {/* Add a class to disable text selection */}
            <div className="disable-text-selection"></div>
          </Worker>
        ) : (
          <iframe
            title="pdf-viewer"
            src={url}
            className="w-full h-full"
            loading="lazy"
            style={{ pointerEvents: "none" }} // Disable interactions for iframe mode
          />
        )}
      </div>
    </PreventSaveProvider>
  );
};

export default PdfUI;
