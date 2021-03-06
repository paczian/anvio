#!/bin/bash
source 00.sh
set -e

INFO "Creating the output directory ..."
# change directory and clean the old mess if it exists
cd sandbox/files_for_manual_interactive
rm -rf test-output
mkdir test-output

INFO "Anvo'o version ..."
anvi-profile --version

INFO "Generating a newick file from the data ..."
anvi-matrix-to-newick view_data.txt -o test-output/tree.txt

INFO "Running the interactive interface on files"
anvi-interactive -f fasta.fa -d view_data.txt -A additional_view_data.txt -t test-output/tree.txt --manual-mode -p test.db --title 'Interactive Tree For User Provided Files'
