{pkgs}: {
        channel = "stable-24.05";
        packages = [
          pkgs.nodejs_20
        ];
        idx.extensions = [
          "dbaeumer.vscode-eslint"
        ];
        idx.previews = {
          previews = {
            web = {
              command = [
                "npm"
                "run"
                "dev"
                "--"
                "--port"
                "$PORT"
                "--host"
                "0.0.0.0"
              ];
              manager = "web";
            };
          };
        };
      }