# Given a TMX file with three layers, this will convert it into the format that
# we need.
import re
import sys

# The width and height of the map. This will be pulled from the file.
height = None
width = None

savedMapFile = None
convertedMapFile = None

# Skips all lines until the <data encoding="csv"> line is read in.
def fastForwardToData():
    line = ''
    while not 'data encoding' in line :
        line = savedMapFile.readline()

# Reads 'height' lines and converts it to the format we need, then writes it to
# the file.
# 
# 'header' is just a string that's written to the file before anything else.
# 'treatAsBool' will convert all 0-indices to false, everything else to true.
def readData(header, treatAsBool=False) :
    convertedMapFile.write(header)
    for i in range(height) :
        line = savedMapFile.readline()

        # Cut off the \n
        line = line[:-1]
        indices = line.split(',')
        count = 0
        for index in indices :
            # Ignore the empty string created by having a comma at the end of
            # the line.
            if index == '' : break
            indexAsInt = int(index)
            if treatAsBool :
                # Output 0 or 1 instead of false/true because it takes fewer
                # characters, and the map files can get big.
                zeroOrOne = 0 if indexAsInt is 0 else 1
                convertedMapFile.write(str(zeroOrOne) + ',')
            else :
                # Output -1 instead of "undefined" to save characters.
                convertedMapFile.write(str(indexAsInt - 1) + ',')
            count += 1
            if count is width :
                convertedMapFile.write('\n\t')

    convertedMapFile.write('],')

def readMapDimensions() :
    global height, width
    lineWithDimensions = savedMapFile.readline()
    m = re.search('height="(?P<height>\d+)"', lineWithDimensions)
    height = int(m.group('height'))
    m = re.search('width="(?P<width>\d+)"', lineWithDimensions)
    width = int(m.group('width'))

    print "Width: %d" % (width)
    print "Height: %d" % (height)

def main():
    args = sys.argv
    if len(args) is not 3 :
        print 'Usage: %s <path to input file> <path to output file>' % (args[0])
        print 'Make sure the input file was exported with encoding==CSV!'
        print 'To do this in Tiled, go to Edit --> Preferences --> General'
        return -1

    # It would be better to check for path equality, but it's better to have
    # SOME error-checking than none.
    if args[1].lower() == args[2].lower() :
        print 'Error: you can\'t specify the same input/output file'
        return -1

    global savedMapFile, convertedMapFile
    savedMapFile = open(args[1], 'r')
    convertedMapFile = open(args[2], 'w')

    # Burn the <XML> line
    savedMapFile.readline()

    readMapDimensions()    

    # Read in tiles
    fastForwardToData()
    readData('overworldMapTileIndices: [\n\t')
    convertedMapFile.write('\n\n')

    fastForwardToData()
    readData('overworldExtra: [\n\t')
    convertedMapFile.write('\n\n')
    
    fastForwardToData()
    readData('overworldPaths: [\n\t')
    convertedMapFile.write('\n\n')

    fastForwardToData()
    readData('overworldDoodadIndices: [\n\t')
    convertedMapFile.write('\n\n')

    fastForwardToData()
    readData('overworldWalkability: [\n\t', True)

    savedMapFile.close()
    convertedMapFile.close()

if __name__ == '__main__':
    main()