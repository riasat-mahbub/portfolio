---
title: "Writing LaTeX Locally with VSCode and TeX Live"
description: "Overleaf's new compile-time limits make local LaTeX a real option again. A more explicit walkthrough of the VSCode + TeX Live setup, including the Windows-specific fixes that took me too long to find the first time."
tags: ["Overleaf", "VSCode", "Linux", "Windows", "LaTeX", "Tooling"]
publishDate: 2026-08-08
---

Overleaf's new compile-time limits make long projects harder to host there. A thesis-sized document hits the ceiling before it finishes compiling. The workaround is to move the build locally, and the cheapest way to do that is VSCode with the LaTeX Workshop extension and a TeX Live install.

I have had people ask me how to set this up repeatedly, so this is me writing it down once. Special thanks to [Jia Jia](https://mathjiajia.github.io/vscode-and-latex/), whose [original guide](https://mathjiajia.github.io/vscode-and-latex/) is the starting point for this one. Jia Jia also has a [Neovim version](https://mathjiajia.github.io/neovim-latex/) if you prefer that editor.

This post is more explicit at the OS-specific install steps, and the Windows panel inside Section 7 covers fixes that took me too long to find going in. Linux users can skim past it.

## 1. Install TeX Live

Pick your OS:

<details open>
<summary>Linux and Unix</summary>

The [TeX Live quick install guide](https://www.tug.org/texlive/quickinstall.html) is the canonical reference. The short version:

1. Download the installer:

```sh
wget https://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz
```

If the link is dead, grab the current one from the quick install guide.

2. Extract and run:

```sh
tar -xf install-tl-unx.tar.gz
cd install-tl-2*
perl ./install-tl --no-interaction
```

The `--no-interaction` flag skips the options menus. The full install takes a while, so leave it running.

3. Add the binary to your `PATH`. This part is missing from the official guide.

   Get the install path:

```sh
ls -d /usr/local/texlive/20*/bin/*
```

Append an export line to your shell config. The command differs by shell. Check with `echo $SHELL`.

```sh
echo 'export PATH="[your path]:$PATH"' >> ~/.bashrc
```

Substitute `[your path]` with the result from the `ls` command above. I use bash, so the file is `.bashrc`. For zsh, use `.zshrc`. Fish users can run `fish_add_path /usr/local/texlive/2026/bin/x86_64-linux`.

Reload the config and verify:

```sh
source ~/.bashrc
which pdflatex
```

Both `pdflatex` and `biber` should resolve to a path inside `/usr/local/texlive/`.

</details>

<details>
<summary>Mac</summary>

Skip the Unix path. [MacTeX](https://www.tug.org/mactex/mactex-download.html) handles the install cleanly.

</details>

<details>
<summary>Windows</summary>

Windows has its [own installer](https://mirror.ctan.org/systems/texlive/tlnet/install-tl-windows.exe). Run it. The PATH is set automatically, so no shell config edits.

</details>

## 2. Install VSCode

The [official installer](https://code.visualstudio.com/) works on every OS. On Linux, `pacman -S code` (Arch) or `apt install code` (Ubuntu/Debian) both work.

## 3. Install the LaTeX Workshop extension

It is the de facto VSCode LaTeX extension. Search for it in the extension panel, or use [this link](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) if the search misses.

## 4. Pull your Overleaf source

In Overleaf, go to `Menu` → `Download` → `Download as source .zip`. Extract the zip locally. On Arch, `bsdtar xvf filename.zip` works out of the box. On other systems, `unzip` or a file manager both work.

## 5. Open the folder in VSCode

`File` → `Open Folder`, then pick the directory you just extracted. The build expects the main `.tex` file at the root of the folder.

## 6. Build it

Click the green play button in the top-right of the editor. LaTeX Workshop picks the default recipe and runs it.

![Screenshot of the VSCode editor with the main .tex file open, focused on the top-right title bar where the green "Build LaTeX project" play button is visible.](public/images/blog/local-latex-with-vscode-and-texlive/build_latex.png)

If the build needs `biber` (any document with bibliography), the default recipe handles it. If you want a different recipe (e.g, your preferred workflow, windows specific flow fix for biber), the TeX sidebar on the left lets you pick one.


![ screenshot of the LaTeX Workshop sidebar in VSCode, the "Recipe" dropdown showing the custom "pdflatex -> biber -> pdflatex x 2" recipe selected instead of the default.](public/images/blog/local-latex-with-vscode-and-texlive/latex_tab.png)

For a side-by-side preview of the source and the rendered PDF, open the preview tab.

![Screenshot of the VSCode editor with the PDF preview panel open on the right and the .tex source on the left, showing the same content rendered in both.](public/images/blog/local-latex-with-vscode-and-texlive/preview_tab.png)

## 7. Troubleshooting

The build works on most systems the first time. These are the fixes for the cases where it does not. Pick your OS.

<details open>
<summary>Linux build fixes</summary>

Two things, depending on your distro, plus a shell gotcha.

### `libxcrypt-compat` on Arch

Skip this on Debian/Ubuntu. On Arch, biber is dynamically linked against the legacy `libxcrypt` symbols, and the newer toolchain no longer ships them. The error is `undefined symbol` from biber, with no hint that a package is missing. Install `libxcrypt-compat` and biber works:

```sh
sudo pacman -S libxcrypt-compat
```

### Stale build files after Overleaf

Overleaf's `.aux`, `.bbl`, `.fls`, and `.fdb_latexmk` files have a different timestamp ordering than the local toolchain expects. The first compile after switching to local keeps failing with "file has changed since I last read it." Run `latexmk -C` once before the first local build to clear the cache:

```sh
latexmk -C
```

The build regenerates the auxiliary files. The PDF gets regenerated alongside them.

### Open a new terminal after editing your shell config

The `export PATH=...` line only loads when the shell config is sourced. New terminals source it automatically. Existing terminals do not. After editing `~/.bashrc`, open a new terminal; for an existing zsh session, run `source ~/.zshrc` before checking `which pdflatex`.

</details>

<details>
<summary>Windows build fixes</summary>

Four things, in order.

### Perl

Windows does not ship Perl. LaTeX Workshop's default recipe calls Perl under the hood, so it fails silently without it. Strawberry Perl is the usual choice:

```sh
winget install StrawberryPerl.StrawberryPerl
```

Run from PowerShell, or download it from [strawberryperl.com](https://strawberryperl.com/).

### A custom recipe that runs biber

The workshop's default recipe does not always process `biber` on Windows. The fix is a custom recipe: `pdflatex` once to seed the `.aux`, `biber` to resolve citations, then `pdflatex` twice more so both the in-text citations and the bibliography page pick up the new `.bbl`.

Open the settings JSON with `Ctrl+Shift+P` → `Preferences: Open User Settings (JSON)`.


![screenshot of the command palette with "Preferences: Open User Settings (JSON)" highlighted, the VSCode settings.json file visible in the editor](public/images/blog/local-latex-with-vscode-and-texlive/preferences_user.png)

Add this to the root `{}`:

```json
"latex-workshop.latex.tools": [
  {
    "name": "pdflatex",
    "command": "pdflatex",
    "args": [
      "-synctex=1",
      "-interaction=nonstopmode",
      "-file-line-error",
      "%DOC%"
    ]
  },
  {
    "name": "biber",
    "command": "biber",
    "args": [
      "%DOCFILE%"
    ]
  }
],
"latex-workshop.latex.recipes": [
  {
    "name": "pdflatex -> biber -> pdflatex x 2",
    "tools": [
      "pdflatex",
      "biber",
      "pdflatex",
      "pdflatex"
    ]
  }
]
```

> The recipe name uses `->` as the arrow. The unicode arrow `➞` works in `settings.json` if you prefer it. LaTeX Workshop renders the name in the UI, so both display correctly.

### The biber temp directory lock

`biber` is a packed executable that extracts internal Perl files to `%TEMP%\par-USERNAME\` on every run. Windows Defender and the search indexer both lock that directory just often enough to make biber exit with an error that does not mention the temp path. The error reads like a biber crash. The directory lock is the actual cause. Point biber at a different directory:

1. Create a working directory:

```powershell
New-Item -ItemType Directory -Path "C:\tex_tmp"
```

2. Search Windows for "Edit the system environment variables" and open it.

3. Add a User Variable with `Variable name: PAR_GLOBAL_TMPDIR` and `Variable value: C:\tex_tmp`.


![screenshot of the Windows System Properties → Environment Variables dialog](public/images/blog/local-latex-with-vscode-and-texlive/save_PATH.png)

### Clear auxiliary files

After swapping the recipe, clean up any stale build state. `Ctrl+Shift+P` → `LaTeX Workshop: Clean up auxiliary files`, then restart VSCode.


![screenshot of the command palette with "LaTeX Workshop: Clean up auxiliary files" highlighted.](public/images/blog/local-latex-with-vscode-and-texlive/clean_up_1.png)

Alternately, you can use the sidebar of LaTeX workshop extension.

![screenshot of the latex Tab with "LaTeX Workshop: Clean up auxiliary files" highlighted.](public/images/blog/local-latex-with-vscode-and-texlive/latex_tab copy.png)
</details>

## 8. Notes

## Custom fonts

If your document uses a font outside the standard `texlive-fonts-recommended` set, you need the matching `texlive-fonts-extra` package or the font installed at the OS level. Specific cases:

a. `fontspec` with system fonts (Inter, Roboto, etc.) needs the font installed at the OS level AND `\setmainfont{Inter}` declared in the preamble. OS-only install is not enough.

b. CJK fonts (Noto Sans CJK) need the `texlive-lang-chinese` or `texlive-lang-japanese` collections on Linux. They are not pulled in by the default install.

c. Times-style math packages (`mathptmx`, `newtxtext`, `newtxmath`) live in `texlive-fonts-extra`. The error is a "file not found" from `pdflatex`.

## Real Time Collaboration
One thing that's missing from this setup is the easy real-time collaboration you can get on Overleaf, even with free tier. If you really need something similar, you can either a) use git with GitHub to collaborate with others with a shared repo, b) Use vsCode's [collaboration session](https://learn.microsoft.com/en-us/visualstudio/liveshare/use/share-project-join-session-visual-studio-code) feature. Both come with their own caveats, so if you really need to replicate this particular feature, it seems more hassle-free to just pay for a paid plan.  

## 9. Wrapping up

Congratulations on following the guide to its fullest and having your own LaTeX setup. You now don't have to worry about Overleaf's compile time restrictions anymore! Now you can make your thesis drafts, journal articles etc as long as you can without having to pay for premium. You can also keep track of your files with git, committing when a part of your work is done. You can also use other VS Code extensions for adding cool functionality to latex. I recommend [Code spell checker](https://open-vsx.org/vscode/item?itemName=streetsidesoftware.code-spell-checker), [LTeX+](https://open-vsx.org/vscode/item?itemName=ltex-plus.vscode-ltex-plus) to start off. Have fun writing your own LaTex projects locally. 

Need help with something this guide does not cover? Find me on [GitHub](https://github.com/riasat-mahbub), [LinkedIn](https://www.linkedin.com/in/riasat-m-70682b115/), or [Twitter](https://x.com/RiasatM1740).
