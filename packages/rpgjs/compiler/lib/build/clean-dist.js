import fs from 'fs';
import path from 'path';
function deleteFolderRecursive(directory) {
    if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach((file) => {
            const curPath = path.join(directory, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // Si c'est un dossier, supprimez-le récursivement
                deleteFolderRecursive(curPath);
            }
            else {
                // Supprimez le fichier
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directory);
    }
}
export const cleanDist = (outputDir = 'dist') => {
    const distDirectory = path.resolve(outputDir);
    deleteFolderRecursive(distDirectory);
    fs.mkdirSync(distDirectory);
};
//# sourceMappingURL=clean-dist.js.map