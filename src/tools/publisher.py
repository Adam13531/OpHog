# Thu 04/03/2014 - 01:37 PM
#
# This will concatenate all .js files into a single file, then run UglifyJS on
# it.
# 
# Order of the JavaScript files matters, so we can't just consolidate them all
# using a one-line batch script:
#   for /F %%G in ('dir /s /b %1\*.js') do (type %%G >> %outputFile%)
#   
# Requirements for this script:
#   node.js - it must be in your PATH. If it isn't, then just modify minifyFile
#       in this script to point directly to node.js on your computer.
#       http://nodejs.org/
#   UglifyJS - https://github.com/mishoo/UglifyJS
#   Java - must be in your PATH
#   yuicompressor-2.4.8.jar - must be in your PATH. I hard-coded the script to 
#       use this version because I'm lazy.

import os
import sys
import re
import subprocess

# The name that appears in each <script> tag in the html file.
JS_DIRECTORY_NAME = 'js'


CSS_DIRECTORY_NAME = 'css'

# The name of the minified output of this script.
MINIFIED_JS_NAME = 'min.js'

# The path to the minified JavaScript output.
minifiedJsFilePath = None

# The path to index.html that you provide to this script.
inputHtml = None

# The output HTML file that will now reference the minified script.
outputHtmlFilePath = None

# This is the "js" directory that exists alongside index.html. It is computed by
# this script, but it still needs to exist.
jsDir = None

# The path to UglifyJS. It is assumed that 
uglifyJsPath = None

# I put the "minified" output HTML in a "game" folder, so to get from my output
# folder ("game") to the original index.html, I need to provide "../src/" to
# this script, that way all of the scripts/css files will still resolve.
pathFromOutputToInput = ''

soundManager2License = """
SoundManager 2 License:
SoundManager 2: JavaScript Sound for the Web
----------------------------------------------
http://schillmania.com/projects/soundmanager2/

Copyright (c) 2007, Scott Schiller. All rights reserved.
Code provided under the BSD License:
http://schillmania.com/projects/soundmanager2/license.txt

V2.97a.20130512
"""
jQueryAndJQueryUILicense = """
JQuery and JQueryUI license: https://jquery.org/license/
"""
jGesturesLicense = """
jGestures license:
Copyright 2010-2011 Neue Digitale / Razorfish GmbH
Copyright 2011-2012, Razorfish GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
modernizrLicense = """
modernizr license:
Copyright (c) 2009-2013
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
"""
hammerLicense = """
Hammer.js license:
Hammer.JS - v1.0.6dev - 2013-07-12
http://eightmedia.github.com/hammer.js
Copyright (c) 2013 Jorik Tangelder <j.tangelder@gmail.com>;
Licensed under the MIT license 
"""

# Concatenates the contents of each file.
# jsFiles - an array of paths (they can be relative) to each JavaScript file.
def concatenateAllFiles(jsFiles) :
    with open(minifiedJsFilePath, 'w') as concatFile :
        for jsFile in jsFiles :
            with open(jsFile, 'r') as f :
                lines = f.readlines()

            for line in lines :
                concatFile.write(line)

# Same as os.path.join, but instead of using os.sep, it will always use forward
# slashes.
def pathJoin(*args) :
    joined = os.path.join(*args)
    return joined.replace("\\","/")

def verifyArgs() :
    global inputHtml, outputHtmlFilePath, jsDir, minifiedJsFilePath, uglifyJsPath, pathFromOutputToInput, inputDir

    args = sys.argv
    if len(args) < 4 :
        print 'Usage: %s <path to index.html> <path to output HTML file> <path to uglifyjs> [path from output HTML to input HTML]' % (args[0])
        return False

    # It would be better to check for path equality, but it's better to have
    # SOME error-checking than none.
    if args[1].lower() == args[2].lower() :
        print 'Error: you can\'t specify the same input/output file'
        return False

    inputHtml = args[1]
    outputHtmlFilePath = args[2]
    uglifyJsPath = args[3]

    if len(args) >= 5 :
        pathFromOutputToInput = args[4]

    inputDir = os.path.dirname(inputHtml)
    jsDir = os.path.join(inputDir, JS_DIRECTORY_NAME)
    minifiedJsFilePath = os.path.join(jsDir, MINIFIED_JS_NAME)

    if not os.path.exists(inputHtml) :
        print 'Error: %s doesn\'t exist.' % (inputHtml)
        return False

    if not os.path.exists(uglifyJsPath) :
        print 'Error: %s doesn\'t exist.' % (uglifyJsPath)
        return False

    if not os.path.exists(jsDir) :
        print 'Error: %s doesn\'t exist. index.html must be located alongside a "%s" directory for this script to work.' % (jsDir, JS_DIRECTORY_NAME)
        return False

    return True

# Go through index.html and find all the JavaScript files that need to be
# consolidated. This also starts writing to the output index.html file
def findJsFilesToConsolidate() :
    jsFiles = []

    # Read all lines from index.html
    with open(inputHtml, 'r') as f :
        lines = f.readlines()

    outputHtmlFile = open(outputHtmlFilePath, 'w')

    wroteMinifiedJsLine = False
    for line in lines :
        # Ignore blank lines
        if line.strip() == '' : continue

        writeLine = True

        match = re.match('.*stylesheet.*"' + CSS_DIRECTORY_NAME + '/(?P<filename>.*)"', line, re.IGNORECASE)
        if match :
            filename = match.groups('filename')[0]
            writeLine = False

            minify = True
            if filename.lower().find('min.css') is not -1 :
                minFilename = filename
                minify = False
            else :
                minFilename = filename.replace('.css', '.min.css');
            newCssDir = pathJoin(pathFromOutputToInput, CSS_DIRECTORY_NAME)
            text = line.replace(filename, minFilename).replace(CSS_DIRECTORY_NAME + '/', newCssDir + '/')
            outputHtmlFile.write(text)

            # Minify the CSS right away
            inputCss = os.path.join(inputDir, CSS_DIRECTORY_NAME, filename)
            minFilename = os.path.basename(minFilename)
            if minify :
                subprocess.call(['java', '-jar', 'yuicompressor-2.4.8.jar', inputCss, '-o', minFilename])

        # Find only <script> tags whose src starts with JS_DIRECTORY_NAME.
        match = re.match('.*<script\s+src="' + JS_DIRECTORY_NAME + '/(?P<filename>.*)"', line, re.IGNORECASE)
        if match :
            filename = match.groups('filename')[0]
            writeLine = False

            # If this was already minified, then just output it but with the correct directory.
            if filename.lower().find('min.js') is not -1 :
                correctFullPath = pathJoin(pathFromOutputToInput, 'js', filename)
                outputHtmlFile.write(line.replace('js/' + filename, correctFullPath))
                pass
            else :
                jsFile = os.path.join(jsDir, filename)
                jsFiles.append(jsFile)
                print '[' + jsFile + ']'

                # Write out our minified JS script only once in place of one of
                # the scripts we found.
                if not wroteMinifiedJsLine :
                    wroteMinifiedJsLine = True
                    writeDir = pathJoin(pathFromOutputToInput, JS_DIRECTORY_NAME, MINIFIED_JS_NAME)
                    outputHtmlFile.write('\t\t<script src="%s"></script>\n' % (writeDir))

        if writeLine :
            outputHtmlFile.write(line)

    outputHtmlFile.close()

    return jsFiles

# Call UglifyJS using node.js in order to minify the JavaScript file.
def minifyFile() :
    print "Calling UglifyJS now. This step takes several seconds."
    output = subprocess.check_output(['node', uglifyJsPath, minifiedJsFilePath])

    with open(minifiedJsFilePath, 'w') as minifiedJsFile :
        minifiedJsFile.write('/**')
        minifiedJsFile.write(soundManager2License)
        minifiedJsFile.write(jQueryAndJQueryUILicense)
        minifiedJsFile.write(jGesturesLicense)
        minifiedJsFile.write(modernizrLicense)
        minifiedJsFile.write(hammerLicense)
        minifiedJsFile.write('*/')
        minifiedJsFile.write(output)

def main() :
    if not verifyArgs() : return -1

    jsFiles = findJsFilesToConsolidate()

    concatenateAllFiles(jsFiles)

    minifyFile()

    print "Done. Paths:"
    print "\tMinified JavaScript file: %s" % (minifiedJsFilePath)
    print "\tModified index.html: %s" % (outputHtmlFilePath)
    print "\tModified CSS files: this directory (*.min.css)"

if __name__ == '__main__':
    main()