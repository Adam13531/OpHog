:: This script simply renames all .m4a files in the current directory to mp4.
forfiles /M *.m4a /c "cmd /c del @fname.mp4 & ren @file @fname.mp4 && del @file"