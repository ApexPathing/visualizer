import { DiscordSVG, GithubSVG } from "./media-icons";

export default function PageNavbar() {
  return (
    <div className="flex w-full h-14 border border-border items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <img src="./logo_icon.svg" alt="Logo" className="mr-2 size-7" />
        <span className="font-bold">Apex Pathing Visualizer</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <a
          href="https://github.com/ApexPathing"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubSVG className="size-7" />
        </a>
        <a
          href="https://discord.gg/qpP4CXaHDg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DiscordSVG className="size-7" />
        </a>
      </div>
    </div>
  );
}