export default function DashboardLoading() {
  return (
    <main className="pageFrame workspacePage">
      <div className="landingWrap">
        <section className="dashboardHero dashboardLoadingHero">
          <div className="dashboardHeroCopy">
            <div className="loadingLine loadingLineEyebrow" />
            <div className="loadingLine loadingLineTitle" />
            <div className="loadingLine loadingLineBody" />
          </div>
        </section>

        <section className="sectionBlock dashboardLoadingBlock">
          <div className="dashboardLoadingGrid">
            <div className="loadingCard" />
            <div className="loadingCard" />
            <div className="loadingCard" />
            <div className="loadingCard" />
          </div>
        </section>

        <section className="sectionBlock dashboardLoadingBlock">
          <div className="dashboardLoadingBoard">
            <div className="loadingBoardLane" />
            <div className="loadingBoardLane" />
            <div className="loadingBoardLane" />
          </div>
        </section>
      </div>
    </main>
  );
}
