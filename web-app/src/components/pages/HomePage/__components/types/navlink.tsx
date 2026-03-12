export type NavLink =
  | { label: string; target: string }
  | { label: string; href: string }
  | {
      label: string;
      type?: "history" | "support";
      megaMenu: {
        highlight: {
          title: string;
          desc: string;
          icon: string;
          action?: {
            label: string;
            target?: string;
            href?: string;
            isStart?: boolean;
          };
        };
        items: {
          label: string;
          desc?: string;
          icon: string;
          target?: string;
          href?: string;
        }[];
      };
    }
  | {
      label: string;
      type: "history";
      megaMenu: {
        highlight: {
          title: string;
          desc: string;
          icon: string;
        };
      };
    };
