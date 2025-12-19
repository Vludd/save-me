import packageJson from "../../../package.json";

export const Footer = () => {
  const __APP_VERSION__ = packageJson.version;

  return (
    <footer className="border-t bg-background p-2">
      <p className="text-muted-foreground text-xs text-center mt-2">
        save.me v{__APP_VERSION__}
      </p>
    </footer>
  );
};
