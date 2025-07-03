#!/bin/bash

# Vytvoření adresářové struktury
mkdir -p src/{components/{layout,ui,features},hooks,services,styles,types,utils,contexts}
mkdir -p src/components/layout/{Sidebar,Header,Container}
mkdir -p src/components/ui/{Button,Card,Form,Modal,Loader}
mkdir -p src/components/features/{ArtworkGallery,ArtistProfile,ProjectBoard}

echo "Structure created!"
