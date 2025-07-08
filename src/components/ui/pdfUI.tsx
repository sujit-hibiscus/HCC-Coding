"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRedux } from "@/hooks/use-redux"
import { useChromeSearch } from "@/hooks/useChromeSearch"
import { updatePdfFilters } from "@/store/slices/pdfFiltersSlice"
import { ProgressBar, RotateDirection, Viewer, Worker } from "@react-pdf-viewer/core"
import "@react-pdf-viewer/core/lib/styles/index.css"
import { defaultLayoutPlugin, type ToolbarSlot } from "@react-pdf-viewer/default-layout"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"
import { searchPlugin } from "@react-pdf-viewer/search"
import "@react-pdf-viewer/search/lib/styles/index.css"
import React, { type ReactElement, useEffect } from "react"

interface PdfViewerProps {
  url: string
  isViewer?: boolean
  isFlattened?: boolean
}

const PdfUI: React.FC<PdfViewerProps> = ({ url: urlData = "", isViewer = true }) => {
  const [url] = urlData.split("__")

  const { dispatch, selector } = useRedux()

  const savedFilters = selector((state) => state.pdfFilters[url])
  const [currentPage, setCurrentPage] = React.useState<number>(savedFilters?.currentPage || 1)
  const [zoom, setZoom] = React.useState<number>(savedFilters?.zoom || 100)
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(savedFilters?.isDarkTheme || false)

  // Use the Chrome search hook
  const {
    searchTerm,
    setSearchTerm,
    currentMatchIndex,
    totalMatches,
    isSearchVisible,
    setIsSearchVisible,
    isCaseSensitive,
    setIsCaseSensitive,
    searchMatches,
    handleSearchChange,
    handleNextMatch,
    handlePreviousMatch,
    clearHighlights,
    applyHighlightsOnly,
  } = useChromeSearch()
  const searchPluginInstance = searchPlugin()

  const renderToolbar = (Toolbar: (props: { children: (slots: ToolbarSlot) => ReactElement }) => ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        if (!slots) return <></>

        const {
          CurrentPageInput,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Zoom,
          ZoomIn,
          ZoomOut,
          Rotate,
          GoToLastPage,
          GoToFirstPage,
        } = slots

        return (
          <div className="flex items-center w-full px-2">
            <TooltipProvider>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2"
                      onClick={() => {
                        handleSearchChange("")
                        setIsSearchVisible(false)
                      }
                      }
                    >
                      <ZoomOut />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    Zoom Out
                  </TooltipContent>
                </Tooltip>

                <div className="font-semibold" onClick={() => {
                  handleSearchChange("")
                  setIsSearchVisible(false)
                }
                }>
                  <Zoom />
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="pt-2" onClick={() => {
                      handleSearchChange("")
                      setIsSearchVisible(false)
                    }
                    }>
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
                {/*  <ChromeSearchBar
                  isSearchVisible={isSearchVisible}
                  setIsSearchVisible={setIsSearchVisible}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  currentMatchIndex={currentMatchIndex}
                  setCurrentMatchIndex={() => { }}
                  totalMatches={totalMatches}
                  setTotalMatches={() => { }}
                  isCaseSensitive={isCaseSensitive}
                  setIsCaseSensitive={setIsCaseSensitive}
                  searchMatches={searchMatches}
                  setSearchMatches={() => { }}
                  isDarkTheme={isDarkTheme}
                  onSearchChange={handleSearchChange}
                  onNextMatch={handleNextMatch}
                  onPreviousMatch={handlePreviousMatch}
                  onClearHighlights={clearHighlights}
                /> */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={` h-8 w-8 !bg-transparent !text-[#585858]`}
                    >
                      <Rotate direction={RotateDirection?.Forward} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    Rotate
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
          </div >
        )
      }}
    </Toolbar >
  )

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [defaultTabs[0]],
    renderToolbar,
  })

  const characterMap = React.useMemo(() => {
    return {
      isCompressed: false,
      url: "",
      get: () => "",
    }
  }, [])

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
    )
  }, [currentPage, zoom, url, dispatch, isDarkTheme])

  return (
    <div className={`w-full h-full border-none relative ${isDarkTheme ? "dark-theme" : "light-theme"}`}>
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
              plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
              onPageChange={(page) => {
                setCurrentPage(page.currentPage + 1)
                applyHighlightsOnly(searchTerm)
              }}
              onZoom={(newZoom) => {
                if (newZoom?.scale > 0.3 && newZoom?.scale < 4) {
                  setZoom(newZoom?.scale * 100)
                } else {
                  setZoom(100)
                }
              }}
              onSwitchTheme={(theme) => {
                setIsDarkTheme(theme === "dark")
              }}
              characterMap={characterMap}
            />
          </div>
        </Worker>
      ) : (
        <iframe
          title="pdf-viewer"
          src={url}
          className="w-full h-full"
          loading="lazy"
          style={{ pointerEvents: "none" }}
        />
      )}
    </div>
  )
}

export default PdfUI
